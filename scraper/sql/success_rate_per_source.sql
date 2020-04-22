WITH DATA1 AS (
	SELECT        
			source_name, 
			CASE WHEN result = 'success' THEN 1 ELSE 0 END AS success,
			CASE WHEN result = 'error' THEN 1 ELSE 0 END AS error,
			url
	FROM           
			scraped_articles
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
		100.0*success/total AS [% success],
		100.0*error/total AS [% error]
FROM
		DATA4
ORDER BY
		source_name
