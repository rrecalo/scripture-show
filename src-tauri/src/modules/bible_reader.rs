use quick_xml::{Reader, events::Event};
use std::fs::File;
use std::io::{BufReader, Read};
use quick_xml::events::{BytesStart};
use crate::modules::bible::*;
use std::time::Instant;

//pass path argument as "./FILE_NAME.xml"
//reads xml in the format as following:
//a main <bible> tag
//Books with the <b> tag and the 'n' attribute (name of the book)
//Chapters with <c> tag and the 'n' attribute (number of the chapter)
//Verses with the <v> tag and the 'n' attribute (number of the verse)
pub fn create_from_xml(path: &str) -> Bible{
    //path -> "./ESV.xml"
    //let start = Instant::now();
    let file_path = path;
    let file = File::open(file_path).expect("Failed to open ESV.xml");
    let reader = BufReader::new(file);
    let mut xml_reader = Reader::from_reader(reader);

    let mut bible = Bible{books: Vec::new()};
    let mut buf = Vec::new();
    //let mut txt = Vec::new();

    loop {
        match xml_reader.read_event_into(&mut buf) {
        Err(e) => panic!("Error at position {}: {:?}", xml_reader.buffer_position(), e),
        // exits the loop when reaching end of file
        Ok(Event::Eof) => break,

        Ok(Event::Start(e)) => {
            match e.name().as_ref() {
                b"bible" => println!("opening bible tag found!"),
                b"b" => 
                {
                    let mut name_data: Option<Vec<u8>> = None;
                    for attribute in e.attributes() {
                        if let Ok(attribute) = attribute{
                                name_data = Some(attribute.value.to_vec());
                        }
                    }

                    let book_name = String::from_utf8(name_data.unwrap()).unwrap();
                    bible.books.push(Book{name: book_name , chapters: Vec::new()});
                },

                b"c" => { 
                    let mut ch_num_data: Option<Vec<u8>> = None;
                    for attribute in e.attributes(){
                        if let Ok(attribute) = attribute {
                            ch_num_data = Some(attribute.value.to_vec());
                        }
                    }

                    let ch_num = ch_num_data.unwrap();
                    let num = str::parse::<i32>(&String::from_utf8(ch_num).unwrap()).unwrap();
                    let cur_book = bible.books.last_mut();
                    cur_book.unwrap().chapters.push(Chapter { number: num , verses: Vec::new()});
                },

                b"v" => {
                    let mut verse_num_data: Option<Vec<u8>> = None;
                    for attribute in e.attributes(){
                        if let Ok(attribute) = attribute {
                            verse_num_data = Some(attribute.value.to_vec());
                        }
                    }

                    let verse_num = verse_num_data.unwrap();
                    let verse = str::parse::<i32>(&String::from_utf8(verse_num).unwrap()).unwrap();

                    let mut text_buf = Vec::new();
                    loop {
                    match xml_reader.read_event_into(&mut text_buf){
                        Ok(Event::End(ref _e)) => {
                            break;
                        }
                        Ok(Event::Eof) => break,
                        Ok(Event::Text(e)) =>{
                            let inside_text = e.unescape().unwrap().into_owned();
                            let cur_book = bible.books.last_mut().unwrap();
                            let cur_chap = cur_book.chapters.last_mut().unwrap();
                            cur_chap.verses.push(Verse{book_name: cur_book.name.clone(), chapter: cur_chap.number, number:verse, text:inside_text});
                        }
                        _ => (),
                        }
                    }
                },
                _ => (),
            }
        }

        _ => (),
        }
        buf.clear();
    }

    bible

}
