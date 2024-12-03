# Try to GET a nonexistent fragment
GET http://localhost:8080/v1/fragments/notARealFragment/info
[BasicAuth]
user1@email.com:password1

# Expect a 404 response
HTTP/1.1 404
[Asserts]
jsonpath "$.status" == "error"

# POST a fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`This is a fragment!`

# Capture the fragment url and id
HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
[Captures]
url: header "Location"
id: jsonpath "$.fragment.id"

# GET the fragment's info
GET {{url}}/info
[BasicAuth]
user1@email.com:password1

# Assert that the response matches the specification
HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{id}}
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" matches /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+/
jsonpath "$.fragment.updated" matches /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+/
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 19
