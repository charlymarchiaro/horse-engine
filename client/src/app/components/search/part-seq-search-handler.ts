import { SearchScheme } from '../../model/search-scheme.model';
import { DateSpan } from '../keyword-search/model';
import { BackendService } from '../../services/backend.service';
import { EventEmitter } from '@angular/core';
import { generatePidTag } from '../../services/utils/utils';
import { SearchResultsPart, ResultInfo, ResultStatus, PART_SEARCH_NUMBER_OF_TRIES } from '../../model/search.model';


interface PartInfo {
  index: number;
  pidTag: string;
}


export class PartSeqSearchHandler {

  private currentPartInfo: PartInfo;

  private isCancelled: boolean;

  public partRetrieved = new EventEmitter<SearchResultsPart>();
  public searchFinished = new EventEmitter<ResultInfo>();


  constructor(
    private scheme: SearchScheme,
    private partsDateSpans: DateSpan[],
    private backendService: BackendService,
  ) { }


  public async execute() {

    let partIndex = -1;

    // Part loop
    for (const dateSpan of this.partsDateSpans) {

      partIndex++;

      // Try loop
      for (let tryIndex = 0; tryIndex < PART_SEARCH_NUMBER_OF_TRIES; tryIndex++) {

        // Has been cancelled --> stop execution
        if (this.isCancelled) {
          this.emitUserCancellationEvent();
          return;
        }

        const pidTag = generatePidTag();

        this.currentPartInfo = { index: partIndex, pidTag };

        try {
          const result = await this.backendService.articleSearchBooleanQuery({
            pidTag,
            matchConditions: this.scheme.scheme.matchConditions,
            secondaryMatchConditions: this.scheme.scheme.secondaryMatchConditions,
            dateSpan,
          }).toPromise();

          this.partRetrieved.emit({
            partIndex,
            dateSpan: result.dateSpan,
            itemIds: result.articleIds,
          });

          // Success --> search next part
          break;

        } catch (e) {

          // Search is cancelled. An error at this point is most likely due to the
          // database process termination, and should be ignored.
          if (this.isCancelled) {
            this.emitUserCancellationEvent();
            return;
          }

          if (tryIndex === PART_SEARCH_NUMBER_OF_TRIES - 1) {
            // Max retries reached --> Abort search (error)
            console.error(`Search failed ${PART_SEARCH_NUMBER_OF_TRIES} times for part id:${tryIndex} --> aborting.`);
            await this.abortPartSearch(pidTag);

            this.emitErrorEvent(e.message);
            return;

          } else {
            // Part search failed --> retry
            console.warn(`Search failed for part id:${tryIndex} --> retrying.`);
            await this.abortPartSearch(pidTag);
          }
        }
      }
    }

    this.emitSuccessEvent();
  }


  public async cancel() {
    console.log('Search cancelled by user');
    this.isCancelled = true;

    // Abort current part search
    const pidTag = this.currentPartInfo.pidTag;
    this.abortPartSearch(pidTag);
  }


  private async abortPartSearch(pidTag: string) {

    const result = await this.backendService.cancelArticleSearch(pidTag).toPromise();
    console.log(`Part search canceled, pidTag: ${pidTag}, result: ${JSON.stringify(result)}`);
  }


  private emitSuccessEvent() {
    this.searchFinished.emit({
      status: ResultStatus.success,
    });
  }

  private emitErrorEvent(message: string) {
    this.searchFinished.emit({
      status: ResultStatus.error,
      message,
    });
  }

  private emitUserCancellationEvent() {
    this.searchFinished.emit({
      status: ResultStatus.cancelled,
      message: 'Cancelled by user',
    });
  }
}

