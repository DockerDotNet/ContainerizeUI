import environment from "@/config/Environment";

// Base URL for Container API (Modify as needed)
const API_BASE_URL = `${environment.VITE_API_HOST}/api`;

export class WSClient {
    private socket: WebSocket | null = null;
    private eventHandlers: Record<string, (data) => void> = {};
    private url: string;
  
    constructor(url: string) {
      this.url = API_BASE_URL + url;
    }
  
    connect() {
      this.socket = new WebSocket(this.url);
  
      this.socket.onopen = () => console.log("✅ WebSocket Connected");
  
      this.socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.event && this.eventHandlers[message.event]) {
          this.eventHandlers[message.event](message.data);
        }
      };
  
      this.socket.onclose = () => console.warn("⚠️ WebSocket Disconnected");
    }
  
    subscribe(event: string, callback: (data) => void) {
      this.eventHandlers[event] = callback;
    }
  
    unsubscribe(event: string) {
      delete this.eventHandlers[event];
    }
  
    close() {
      this.socket?.close();
    }
  }
  