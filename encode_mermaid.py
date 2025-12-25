
import base64

mermaid_code = """graph TD
    Start([Start: Receive JSON Data]) --> InputProcess[Process Input Data]
    
    subgraph Data Preparation
    InputProcess --> MapEntities[Map Entities]
    MapEntities --> GenRequests[Generate Class Requests]
    GenRequests --> AssignTeachers[Assign Teachers based on Load]
    end

    subgraph Modeling
    AssignTeachers --> InitModel[Initialize CP-SAT Model]
    InitModel --> CreateVars[Create Boolean Variables]
    CreateVars --> FilterRooms[Filter Valid Rooms]
    FilterRooms --> ApplyConstraints[Apply Constraints]
    end

    subgraph Solving
    ApplyConstraints --> Solve[Run CP Solver]
    Solve --> CheckStatus{Status?}
    CheckStatus -- Optimal/Feasible --> ExtractSched[Extract Schedule]
    CheckStatus -- Infeasible --> Fail[Return Empty/Error]
    end

    ExtractSched --> Output([End: Output Schedule JSON])
    Fail --> Output"""

encoded = base64.b64encode(mermaid_code.encode('utf-8')).decode('utf-8')

with open('b64.txt', 'w', encoding='utf-8') as f:
    f.write(encoded)
