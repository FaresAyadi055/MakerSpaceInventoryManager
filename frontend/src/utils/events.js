// src/utils/events.js
class GlobalEvents {
  constructor() {
    this.events = {}
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
    
    // Also listen to window events for cross-component communication
    window.addEventListener(event, callback)
  }

  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback)
    }
    window.removeEventListener(event, callback)
  }

  emit(event, data = null) {
    // Dispatch on window for global listening
    window.dispatchEvent(new CustomEvent(event, { detail: data }))
    
    // Also trigger local callbacks
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data))
    }
  }
}

export const globalEvents = new GlobalEvents()