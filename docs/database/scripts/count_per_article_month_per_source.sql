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
		CONCAT(EXTRACT(YEAR FROM article_date::date), '-', TO_CHAR(EXTRACT(MONTH FROM article_date::date), 'FM00')) AS year_month,
		COUNT(url) AS articles_count
FROM 
		DATA

GROUP BY 
		source_name, 
		year_month
ORDER BY
		source_name,
		year_month