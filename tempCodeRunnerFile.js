// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
const db = db.getSiblingDB('aggree');

// Create a new document in the collection.
db.getCollection('author').insertMany(
    [
        {
            "_id":100,
            "name":"F. Scott Fitzgerald",
            "birth_year":1896
        },
        {
            "_id":101,
            "name":"Goli",
            "birth_year":1977
        },
        {
            "_id":102,
            "name":"gubli",
            "birth_year":1972
        }
    ]
);
