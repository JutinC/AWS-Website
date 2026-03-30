/*
Justin Choi
Period 6 
January 3, 2026
Database Class
*/
package choi.six.aws.database;

//imports section
import choi.six.aws.model.Card;

import java.sql.*;
import java.util.ArrayList;

//Database class
public class CardDatabase {

    //Variables
    public static ArrayList<Card> cardList = new ArrayList<>();
    public static Connection conn = null;

    //Connect method
    public static void connect() {
        //try catch for connection
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            String url = "jdbc:mysql://127.0.0.1:3306/aws";
            String user = "root";
            String password = "K3wlpass!";
            conn = DriverManager.getConnection(url, user, password);
            System.out.println("Database connection established successfully!");

        } catch (ClassNotFoundException | SQLException e) {
            System.err.println("Database connection failed: " + e.getMessage());
            conn = null;
        }
    }

    public static void disconnect() {
        if (conn != null) {
            try {
                conn.close();
            } catch (SQLException e) {
                System.err.println("Error closing: " + e.getMessage());
            }
        }
    }

    //Read method
    public static void readCards() {
        //Sql statement
        String sql = "SELECT id, pageId, title, description, imageUrl, orderIndex, showOnHomepage FROM card ORDER BY pageId, orderIndex";
        
        try {
            //Adds it into cardList to be used in the controller
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(sql);
            cardList.clear();
            while (rs.next()) {
                Card c = new Card(
                    rs.getInt("id"),
                    rs.getInt("pageId"),
                    rs.getString("title"),
                    rs.getString("description"),
                    rs.getString("imageUrl"),
                    rs.getInt("orderIndex")
                );
                c.setShowOnHomepage(rs.getInt("showOnHomepage") == 1);
                cardList.add(c);
            }
            //Catch for any errors
        } catch (SQLException e) {
            System.err.println("readCards failed: " + e.getMessage());
        }
    }

    public static int getMaxOrderIndexForPage(int pageId) {
        if (conn == null) return 0;
        String sql = "SELECT COALESCE(MAX(orderIndex), 0) FROM card WHERE pageId = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, pageId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        } catch (SQLException e) {
            System.err.println("getMaxOrderIndexForPage failed: " + e.getMessage());
        }
        return 0;
    }

    public static Card findCardById(int id) {
        readCards();
        for (Card c : cardList) {
            if (c.getId() == id) {
                return c;
            }
        }
        return null;
    }

    //Create method — returns generated id, or -1 on failure
    public static int createCard(Card card) {
        String sql = "INSERT INTO card (pageId, title, description, imageUrl, orderIndex, showOnHomepage) VALUES (?, ?, ?, ?, ?, ?)";
        try (PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, card.getPageId());
            ps.setString(2, card.getTitle() != null ? card.getTitle() : "");
            ps.setString(3, card.getDescription() != null ? card.getDescription() : "");
            ps.setString(4, card.getImageUrl() != null ? card.getImageUrl() : "");
            ps.setInt(5, card.getOrderIndex());
            ps.setInt(6, card.isShowOnHomepage() ? 1 : 0);
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    int newId = keys.getInt(1);
                    readCards();
                    return newId;
                }
            }
        } catch (SQLException e) {
            System.err.println("createCard failed: " + e.getMessage());
        }
        return -1;
    }

    //Update method
    public static void updateCard(Card card) {
        //Sql statement
        String sql = "UPDATE card SET pageId=?, title=?, description=?, imageUrl=?, orderIndex=?, showOnHomepage=? WHERE id=?";
        
        //Try catch for any errors
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, card.getPageId());
            ps.setString(2, card.getTitle());
            ps.setString(3, card.getDescription());
            ps.setString(4, card.getImageUrl());
            ps.setInt(5, card.getOrderIndex());
            ps.setInt(6, card.isShowOnHomepage() ? 1 : 0);
            ps.setInt(7, card.getId());
            ps.executeUpdate();
            readCards();
        } catch (SQLException e) {
            System.err.println("updateCard failed: " + e.getMessage());
        }
    }

    public static boolean deleteCard(Card card) {
        return deleteCardById(card.getId());
    }

    public static boolean deleteCardById(int id) {
        if (conn == null) return false;
        String sql = "DELETE FROM card WHERE id=?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            int n = ps.executeUpdate();
            readCards();
            return n > 0;
        } catch (SQLException e) {
            System.err.println("deleteCardById failed: " + e.getMessage());
            return false;
        }
    }
}
