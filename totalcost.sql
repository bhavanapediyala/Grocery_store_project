-- SQLite
SELECT Product_ID,
  SUM(Price*Quantity)
  FROM Products
  GROUP BY Product_ID;
 