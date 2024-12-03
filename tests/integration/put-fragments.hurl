# Try to GET a nonexistent fragment
GET http://localhost:8080/v1/fragments/notARealFragment/info
[BasicAuth]
user1@email.com:password1

# Expect a 404 response
HTTP/1.1 404

# POST a fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`This is a fragment!`

# GET it's location
HTTP/1.1 201
[Captures]
url: header "Location"
id: jsonpath "$.fragment.id"

# PUT new data in
PUT {{url}}
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`This is the same fragment!`

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{id}}
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" matches /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+/
jsonpath "$.fragment.updated" matches /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+/
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 26

# GET the updated data
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
Content-Length: 26
[Asserts]
body == "This is the same fragment!"
