WITH DATA AS (
	SELECT        
			source_name, 
			CONVERT(date, last_updated) AS article_date,
			url
	FROM           
			scraped_articles
)
SELECT
		source_name,
		article_date,
		COUNT(url) AS articles_count
FROM DATA

GROUP BY 
		source_name, 
		article_date
ORDER BY
		source_name,
		article_date