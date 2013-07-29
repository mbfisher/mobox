from gmusicapi import Webclient
import json

api = Webclient()
api.login('mike@mbfisher.com', 'biffyclyro')
# => True

library = api.get_all_songs()
print json.dumps(library)
