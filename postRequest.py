import requests

url = 'https://8cdfec44-3da0-4276-878b-298c404593d0-us-east1.apps.astra.datastax.com/api/graphql/entrance'
token = "AstraCS:mMCfrZSKQxqpQlJRPqwKwLuZ:b08c279837481ab4371a03f7f177b601bacc75c85d38fde01fe07263b657d75c"
headers = { 
    'Content-Type': 'application/graphql', 
    'x-cassandra-token': token,
    'Accept': '*/*',
}

body = """mutation {
  user: updateuser_by_id(value: {user_id:"107913638147265361815", connection_id: "69"}, ifExists: true ) {
    value {
      user_id
      connection_id
    }
  }
}"""

response = requests.post(url=url, data=body, headers=headers)
print("Status Code", response.status_code)
print("JSON Response ", response.json())

