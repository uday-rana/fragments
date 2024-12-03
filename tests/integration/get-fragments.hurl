# POST a fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`This is a fragment!`

# Capture the fragment id from the location url
HTTP/1.1 201
[Captures]
id: header "Location" split "/" nth 5

# GET the list of the user's fragments
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

# Assert that the new fragment exists in the users fragment list
HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments" includes {{id}}
