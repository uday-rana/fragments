# 1. POST a fragment and GET it's metadata

POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
{ "service": "DynamoDB" }  

HTTP/1.1 201
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"

GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment" exists
jsonpath "$.fragment.id" == {{fragment1_id}}
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches /^[a-f0-9]+$/
jsonpath "$.fragment.created" matches /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+/
jsonpath "$.fragment.updated" matches /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+/
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 25

# 2. POST another fragment and GET it's metadata

POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1
`DynamoDB is **great**.`

HTTP/1.1 201
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"

GET {{fragment2_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment" exists
jsonpath "$.fragment.id" == {{fragment2_id}}
jsonpath "$.fragment.ownerId" matches /^[a-f0-9]+$/
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" == 22
jsonpath "$.fragment.created" matches /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+/
jsonpath "$.fragment.updated" matches /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+/

# 3. GET all fragment ids for the user and confirm those created above are included

GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.fragments" includes {{fragment1_id}}
jsonpath "$.fragments" includes {{fragment2_id}}

# 4. DELETE the first fragment and try to get it again

DELETE {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

GET {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404

# 5. GET all fragment ids for the user and confirm the deleted fragment's id is not included

GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.fragments" includes {{fragment2_id}}
jsonpath "$.fragments" not includes {{fragment1_id}}
