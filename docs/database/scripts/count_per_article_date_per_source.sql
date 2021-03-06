WITH DATA AS (
	SELECT        
			source.name AS source_name,
			article.last_updated::date AS article_date,
			article.url AS url
	FROM           
			scraper.article_scraping_details AS details
			INNER JOIN scraper.article AS article
				ON article.id = details.article_id
			INNER JOIN scraper.article_source AS source
				ON source.id = article.article_source_id
)
SELECT
		source_name,
		article_date,
		COUNT(url) AS articles_count
FROM 
		DATA

GROUP BY 
		source_name, 
		article_date
ORDER BY
		source_name,
		article_date