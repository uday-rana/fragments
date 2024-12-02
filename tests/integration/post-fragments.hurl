# Authenticated POST to /v1/fragments
# Sending a plain text fragment
# Include HTTP Basic Auth credentials
# The body of the request goes in ```...``` when it's a string

POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`This is a fragment!`

# 1. We expect to get back an HTTP 201
# We have various assertions about the response that we want to check:
# - The Location header should look like what we expect (including the fragment id)
# - Our fragment ids use UUIDs, see https://ihateregex.io/expr/uuid/
# - Our ownerId hash is a hex encoded string
# - Basic check for the presence of created and updated date strings
#   - Could also write a regex for this and use matches
# - 19 is the length of our fragment data: 'This is a fragment!'
# Capture the Location URL into a variable named `url`

HTTP/1.1 201
[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" matches /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+/
jsonpath "$.fragment.updated" matches /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+/
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 19
[Captures]
url: header "Location"

# 2. Try to GET the fragment we just posted by its URL

GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
Content-Length: 19
[Asserts]
body == "This is a fragment!"
