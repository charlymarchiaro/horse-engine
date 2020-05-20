
export type ResponseStatus = 'success' | 'error';


export interface ApiRequestState {
  loaded: boolean;
  loading: boolean;
  error: string;
}

