import json


def lambda_handler(event, context):
    # TODO implement
    # print("connectionId: "+event["headers"]["requestContext"]["connectionId"])
    print(event)
    print("***")
    print("connectionId: "+event["requestContext"]["connectionId"])
    print("***")
    print(context)
    return {"statusCode":200}
