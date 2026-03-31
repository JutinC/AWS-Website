/*
Justin Choi
Period 6 
January 3, 2026
Controller Class
*/
package choi.six.aws.controller;

//Imports section
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import choi.six.aws.database.CardDatabase;
import choi.six.aws.model.Card;
import jakarta.annotation.PostConstruct;

//Controller class
@RestController
@RequestMapping("/api")
public class CardController {

    //Method to connect the database
    @PostConstruct
    public void init() {
        if (CardDatabase.conn == null) {
            CardDatabase.connect();
        }
    }

    //Method for the cards to be displayed
    @GetMapping("/titlecards")
    //Get the lists of car
    public List<Card> getTitleCards(@RequestParam(required = false) Integer pageId) {
        //Checks to connect to database
        if (CardDatabase.conn == null) {
            CardDatabase.connect();
        }
        //Reads the cards from database
        CardDatabase.readCards();

        //When there is a pageId, it will return the cards for the curreng pageId
        if (pageId != null) {
            return CardDatabase.cardList.stream()
                .filter(c -> c.getPageId() == pageId)
                .collect(Collectors.toList());
        }
        //Puts it on homepage in case there is no pageId
        return CardDatabase.cardList.stream()
            .filter(Card::isShowOnHomepage)
            .collect(Collectors.toList());
    }

    //Method to add
    @PostMapping("/titlecards")
    //
    public ResponseEntity<Card> createCard(@RequestParam int pageId, @RequestBody Card body) {
        if (pageId < 1 || pageId > 10) {
            return ResponseEntity.badRequest().build();
        }
        if (CardDatabase.conn == null) {
            CardDatabase.connect();
        }
        body.setPageId(pageId);
        body.setShowOnHomepage(false);
        int max = CardDatabase.getMaxOrderIndexForPage(pageId);
        if (body.getOrderIndex() <= 0) {
            body.setOrderIndex(max + 1);
        }
        int newId = CardDatabase.createCard(body);
        if (newId < 0) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        Card saved = CardDatabase.findCardById(newId);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    //Method to update cards
    @PutMapping("/titlecards/{id}")
    public ResponseEntity<Card> updateCard(@PathVariable int id, @RequestBody Card body) {
        if (CardDatabase.conn == null) {
            CardDatabase.connect();
        }
        Card existing = CardDatabase.findCardById(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        if (existing.isShowOnHomepage()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        body.setId(id);
        body.setPageId(existing.getPageId());
        body.setShowOnHomepage(existing.isShowOnHomepage());
        CardDatabase.updateCard(body);
        return ResponseEntity.ok(CardDatabase.findCardById(id));
    }

    //Method to delete
    @DeleteMapping("/titlecards/{id}")
    public ResponseEntity<Void> deleteCard(@PathVariable int id) {
        if (CardDatabase.conn == null) {
            CardDatabase.connect();
        }
        Card existing = CardDatabase.findCardById(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        if (existing.isShowOnHomepage()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        if (!CardDatabase.deleteCardById(id)) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        return ResponseEntity.noContent().build();
    }
}
