WITH DATA1 AS (
	SELECT        
			source.name AS source_name, 
			CASE WHEN details.result = 'success' THEN 1 ELSE 0 END AS success,
			CASE WHEN details.result = 'error' THEN 1 ELSE 0 END AS error,
			article.url AS url
	FROM           
			scraper.article_scraping_details AS details
			INNER JOIN scraper.article AS article
				ON article.id = details.article_id
			INNER JOIN scraper.article_source AS source
				ON source.id = article.article_source_id
), 
DATA2 AS (
	SELECT
			source_name,
			SUM(success) AS success,
			SUM(error) AS error,
			COUNT(url) AS total
	FROM 
			DATA1
	GROUP BY 
			source_name	
),
DATA3 AS (
	SELECT
			'TOTAL' AS source_name,
			SUM(success) AS success,
			SUM(error) AS error,
			SUM(total) AS total
	FROM
			DATA2
),
DATA4 AS (
	SELECT * FROM DATA2 UNION SELECT * FROM DATA3
)
SELECT 
		source_name,
		total,
		100.0*success/total AS "% success",
		100.0*error/total AS "% error"
FROM
		DATA4
ORDER BY
		source_name
