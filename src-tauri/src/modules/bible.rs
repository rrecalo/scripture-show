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
    pub book_name: String,
    pub chapter: i32,
    pub number: i32,
    pub text: String,
}

impl Book {

    pub fn get_chapter(&self, query: i32) -> Option<Chapter> {

        let mut chapter_match: Option<Chapter> = None;
        for ch in self.chapters.iter(){
            if ch.number == query {
                chapter_match = Some(ch.clone());
            }
       }

        chapter_match
    }

}

impl Chapter {
    
    pub fn get_verse(&self, query: i32) -> Option<Verse> {

        let mut verse_match: Option<Verse> = None;
        for verse in self.verses.iter(){
            if verse.number == query {
                verse_match = Some(verse.clone());
            }
       }

        verse_match
    }

    pub fn get_all_verses(&self) -> Vec<Verse> {
        self.verses.clone()
    }
}

fn jaccard_similarity(s1: &str, s2: &str) -> f64 {
    let set1: std::collections::HashSet<char> = s1.chars().collect();
    let set2: std::collections::HashSet<char> = s2.chars().collect();
    
    let intersection_size = set1.intersection(&set2).count() as f64;
    let union_size = set1.union(&set2).count() as f64;
    
    intersection_size / union_size
}

#[derive(Clone, Serialize)]
pub struct SearchMatch {
    pub reference: String,
    pub similarity: f64,
}

impl Bible {
    
    pub fn get_book_by_name(&self, query: &str) -> Option<Book> {

        let mut book_match: Option<Book> = None;

        for book in &self.books {
            if book.name.to_lowercase().starts_with(query) {
                book_match = Some(book.clone());
                break;
            }
        }

        book_match
    }

        pub fn match_str(&self, query: &str) -> Option<Vec<SearchMatch>> {

            let mut matching_verses: Vec<SearchMatch> = Vec::new();
            for book in &self.books{
                for chapter in &book.chapters{
                    for verse in &chapter.verses{
                        if verse.text.to_lowercase().contains(query){
                            let similarity = jaccard_similarity(&verse.text.to_lowercase(), query);
                            matching_verses.push(SearchMatch {reference: String::from(book.name.clone()+" "+&chapter.number.to_string()+":"+&verse.number.to_string()),
                        similarity: similarity});
                        }
                    }
                }
            }
            matching_verses.sort_by(|a, b| a.similarity.partial_cmp(&b.similarity).unwrap());

            Some(matching_verses)
        }

}


