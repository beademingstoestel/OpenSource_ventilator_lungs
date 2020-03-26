import requests

class APIRequest():

    def __init__(self, base_address):
        self.base_address = base_address

    def __put(self, endpoint, data):
        try:
            r = requests.put(url = self.base_address + endpoint, data = data) 
  
            data = r.json()

            if not data["result"]:
                print("The request was not successful")
        except requests.RequestException:
            print("Couldn't reach the server")

    def send_setting(self, key, val):
        self.__put("/api/settings", {key:val})

    def send_error(self, val):
        self.__put("/api/settings", {'alarmValue':val})
