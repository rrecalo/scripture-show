use serde::Serialize;

use crate::modules::bible_reader::*;
use std::time::Instant;

pub struct Bible {
    pub books: Vec<Book>
}

#[derive(Clone)]
pub struct Book {
    pub name: String,
    pub chapters: Vec<Chapter>
}

#[derive(Clone)]
pub struct Chapter {
    pub number: i32,
    pub verses: Vec<Verse>,
}

#[derive(Clone, Serialize)]
pub struct Verse {
    pub number: i32,
    pub text: String,
}

impl Book {

    pub fn get_chapter(&self, query: i32) -> Chapter {

        let mut chapter_match: Option<Chapter> = None;
        for ch in self.chapters.iter(){
            if ch.number == query {
                chapter_match = Some(ch.clone());
            }
       }

        chapter_match.unwrap()
    }

}

impl Chapter {
    
    pub fn get_verse(&self, query: i32) -> Verse {

        let mut verse_match: Option<Verse> = None;
        for verse in self.verses.iter(){
            if verse.number == query {
                verse_match = Some(verse.clone());
            }
       }

        verse_match.unwrap()
    }

    pub fn get_all_verses(&self) -> Vec<Verse> {
        self.verses.clone()
    }
}

impl Bible {
    
    pub fn get_book_by_name(&self, query: &str) -> Book {

        let mut book_match: Option<Book> = None;

        for book in &self.books {
            if book.name.to_lowercase().starts_with(query) {
                book_match = Some(book.clone());
                break;
            }
        }

        book_match.unwrap()
    }

}


