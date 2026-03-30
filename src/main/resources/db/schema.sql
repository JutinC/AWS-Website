DROP TABLE IF EXISTS card;
CREATE TABLE card (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pageId INT NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    imageUrl VARCHAR(512) DEFAULT '',
    orderIndex INT DEFAULT 0,
    showOnHomepage TINYINT DEFAULT 0
);
