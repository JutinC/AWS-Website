/*
Justin Choi
Period 6 
January 3, 2026
Section 9
*/
package choi.six.aws.model;

/**
 * Plain Java model for a title card.
 * CardDatabase handles SQL.
 */
public class Card {

    private int id;
    private int pageId;
    private String title;
    private String description;
    private String imageUrl;
    private int orderIndex;
    private boolean showOnHomepage;

    public Card() {
        this.id = 0;
        this.pageId = 0;
        this.title = "";
        this.description = "";
        this.imageUrl = "";
        this.orderIndex = 0;
        this.showOnHomepage = false;
    }

    public Card(int id, int pageId, String title, String description, String imageUrl, int orderIndex) {
        this.id = id;
        this.pageId = pageId;
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.orderIndex = orderIndex;
    }

    public int getId() { 
        //User validation goes here
        return id; 
    }
    public void setId(int id) { 
        //User validation goes here
        this.id = id; 
    }

    public int getPageId() { 
        //User validation goes here
        return pageId; 
    }
    public void setPageId(int pageId) { 
        //User validation goes here
        this.pageId = pageId; 
    }

    public String getTitle() { 
        //User validation goes here
        return title; 
    }
    public void setTitle(String title) { 
        //User validation goes here
        this.title = title; 
    }

    public String getDescription() { 
        //User validation goes here
        return description; 
    }
    public void setDescription(String description) { 
        //User validation goes here
        this.description = description; 
    }

    public String getImageUrl() { 
        //User validation goes here
        return imageUrl; 
        }
    public void setImageUrl(String imageUrl) { 
        //User validation goes here
        this.imageUrl = imageUrl; 
    }

    public int getOrderIndex() { 
        //User validation goes here
        return orderIndex; 
    }
    public void setOrderIndex(int orderIndex) { 
        //User validation goes here
        this.orderIndex = orderIndex; 
    }

    public boolean isShowOnHomepage() { 
        return showOnHomepage; 
    }
    public void setShowOnHomepage(boolean showOnHomepage) { 
        this.showOnHomepage = showOnHomepage; 
    }
}
