from django.conf.urls import url

from websocket.consumers import WebSocket

websocket_urlpatterns = [
    url(r'^ws/websocket/$', WebSocket.as_asgi()),
]