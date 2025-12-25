import base64
import json

mermaid_code = """flowchart TD
    subgraph Init [1. Initialization]
        A[Admin/Dev] -->|Runs| B(generate_sample_data.py)
        B -->|Generates| C[(data.json)]
        C -- Contains --> D{Raw Data}
        D --> D1[Batches]
        D --> D2[Teachers]
        D --> D3[Classrooms]
        D --> D4[Subjects]
    end

    subgraph Engine [2. Scheduling Engine]
        D -->|Input| E[scheduler.ts]
        E --> F[Flatten Requirements]
        F --> G[Class Request Queue]
        G --> H{Assignment Loop}
        
        H -->|Pick Request| I[Find Teacher]
        I -->|Check Load/Qual| J{Qualified?}
        J -- Yes --> K[Try Slots]
        J -- No --> I
        
        K -->|Random Slot| L{Constraint Check}
        L -- Valid --> M[Add to Schedule]
        L -- Invalid --> K
    end

    subgraph Output [3. Consumption]
        M -->|Update| C
        C -->|Read by| N[Web Application]
        N --> O[Timetable View]
        N --> P[Teachers View]
    end

    style Init fill:#f9f,stroke:#333,stroke-width:2px
    style Engine fill:#bbf,stroke:#333,stroke-width:2px
    style Output fill:#dfd,stroke:#333,stroke-width:2px
"""

# State for Mermaid Live Editor
state = {
  "code": mermaid_code,
  "mermaid": { "theme": "default" },
  "autoSync": True,
  "updateDiagram": True
}

# State for Mermaid Ink (Image)
ink_state = {
  "code": mermaid_code,
  "mermaid": { "theme": "default" }
}

json_str = json.dumps(state)
encoded_bytes = base64.b64encode(json_str.encode('utf-8'))
encoded_str = encoded_bytes.decode('utf-8')

ink_json_str = json.dumps(ink_state)
ink_encoded_bytes = base64.b64encode(ink_json_str.encode('utf-8'))
ink_encoded_str = ink_encoded_bytes.decode('utf-8')

with open('workflow_link.txt', 'w', encoding='utf-8') as f:
    f.write(f"Editor Link: https://mermaid.live/edit#base64:{encoded_str}\n")
    f.write(f"Image Link: https://mermaid.ink/img/{ink_encoded_str}\n")
