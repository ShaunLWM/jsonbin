# jsonbin
<img src="https://img.shields.io/github/package-json/v/ShaunLWM/jsonbin"/><img src="https://img.shields.io/github/license/ShaunLWM/jsonbin"/><img src="https://img.shields.io/github/commit-activity/m/ShaunLWM/jsonbin"/>

A simple deployable Redis-backed JSON bin for your mini projects.

## Requirements
- redis
- node v8 and above

## Installation
```
git clone https://github.com/ShaunLWM/jsonbin
cd jsonbin
node index.js
```

## Configurations
config.js
```
serverPort: int         // port to run server on (default: 5000)
redisExtension: str     // preceeding text to uniquely identify jsonbin keys (default: bin_)
collectionLength: str   // maximum string length for collection name (default: 20)
dataPerPage: int        // maximum number of data per page for pagination (default: 20)
mainExplanation: strs   // array of strings explaining api methods
```

## API Calls
Generating your personal bin
```
GET /genid

Returns your own personal bin token to use. This shall be referred to as bin_id from now on.
```

### Adding Data
```
POST /bin_id[/collection_name]
HEADER application/json
DATA json_formatted string

Add your json formatted data into your bin.
collection_name is optional if you want to add data into its own personal collection

Example:
/bin_id/students
/bin_id/company
```

### Retreiving Data
```
GET /bin_id[/collection_name][?q=?][?sort=?][?page=?&limit=?][?all=1]

Retrieve your data from bin
If collection_name is given, retrieve data from specific collection
--
if q parameter is given, parse them according to given parameter value
Example: ?q=name:Time,score:>35,age:=30,verified:true
Retrieve data where name is Tim, score more than 35, age is 30 & verified is true
Number operators: >, <, >=, <=
String operators: str* (start with str), *str (end with str), *str* (has str anywhere inbetween)
Boolean operatos: true, false
--
If sort parameter is given, sort them according to ascending [?sort=age] or descending order [?sort=-age]
If page and limit parameters are given, return values based on pagination (default: page 1, limit 20 rows)
If all parameter is given, return all data ignoring page and limit parameters
```

### Deleting Data
```
DELETE /bin_id[/id][/collection_name][?q=?]

Delete full bin data if id and collection name is not given.
Delete id only if id is given
Delete all data from collection is collection is given 
If q is given, it will delete data based on filtering system according to how Retrieving Data works.
```

Updating Data
```
PUT /bin_id/id
HEADER application/json
DATA json_formatted string

Update data based on given id
Note: Partial updating is not yet supported. This will do a full update and replacement.
```

## Credits
- [vasanthv/jsonbox](https://github.com/vasanthv/jsonbox)

# License
MIT (2019) Shaun