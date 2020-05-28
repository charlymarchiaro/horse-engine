WITH DATA AS (
	SELECT        
			source_name, 
			last_updated::date AS article_date,
			url
	FROM           
			scraped_articles
)
SELECT
		source_name,
		CONCAT(EXTRACT(YEAR FROM article_date::date), '-', TO_CHAR(EXTRACT(MONTH FROM article_date::date), '00')) AS date,
		COUNT(url) AS articles_count
FROM DATA

GROUP BY 
		source_name, 
		date
ORDER BY
		source_name,
		date