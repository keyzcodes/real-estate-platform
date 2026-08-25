# System Architecture

## 1. Architecture Style

The Real Estate Platform uses a modular-monolith architecture.

The frontend and backend are separate applications, while the backend is deployed as one application containing clearly separated business modules.

## 2. High-Level Architecture

```mermaid
flowchart TD
    U["Web Browser"]
    F["React Frontend"]
    B["Express Backend"]
    D["Supabase PostgreSQL"]
    E["External Services"]

    U --> F
    F --> B
    B --> D
    B --> E
```
