#!/usr/bin/python3
import websocket
import json
import asyncio
import websockets

class WebsocketHandler():

    def send_msg(self, msg):
        """
        Send the json formatted message with the correctly incremented ID
        """
        self.id += 1
        msg['id'] = self.id
        print(msg)
        self.ws.send(json.dumps(msg))

    def subscribe(self, path):
        """
        Subscribe to updates
        """
        sub_msg = {"type":"sub"}
        path = "/api/" + path
        sub_msg['path'] = path
        self.send_msg(sub_msg)
        reply = self.ws.recv()
        print(reply)

    def do_handshake(self):
        hello_msg = {'type': 'hello', 'version': '2'}
        self.send_msg(hello_msg)
        reply = self.ws.recv()
        print(reply)

    def run(self, name):
        print("Starting {}".format(name))
        self.do_handshake()
        self.subscribe('settings')

        while True:
            json_msg = self.ws.recv()
            msg = json.loads(json_msg)
            if msg['type'] == "ping":
                reply = {'type': 'ping'}
                self.send_msg(reply)

    def __init__(self, addr='localhost', port=3001):
        url = "ws://" + addr + ":" + str(port) + "/"
        self.ws = websocket.WebSocket()
        self.ws.connect(url)
        self.id = 1


if __name__ == "__main__":
    ws = WebsocketHandler()
    ws.run('websocket handler')
