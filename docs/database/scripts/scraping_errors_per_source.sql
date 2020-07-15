SELECT  
		source.name AS source_name,
		'''' || article.id || ''',' AS article_id,
		details.scraped_at,
		details.result,
		article.url AS url
FROM           
		scraper.article_scraping_details AS details
		INNER JOIN scraper.article AS article
			ON article.id = details.article_id
		INNER JOIN scraper.article_source AS source
			ON source.id = article.article_source_id
		INNER JOIN scraper.article_spider AS spider
			ON spider.id = details.article_spider_id
WHERE
		source.name = 'Infonegocios'
		AND details.result = 'error'
ORDER BY
		details.scraped_at DESC
LIMIT 
		1000