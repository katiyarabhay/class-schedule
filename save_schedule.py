
import json
import re

try:
    # Read the debug output, trying utf-16 then utf-8
    content = ""
    try:
        with open('schedule_debug_output.txt', 'r', encoding='utf-16') as f:
            content = f.read()
    except:
        with open('schedule_debug_output.txt', 'r', encoding='utf-8') as f:
            content = f.read()

    # Look for the JSON list. It should start with [ and end with ]
    # The debug logs might be before or after.
    # We'll try to find the last valid JSON array in the output.
    
    # Simple heuristic: find the index of '[' and matching ']'
    start_idx = content.find('[')
    end_idx = content.rfind(']')
    
    if start_idx != -1 and end_idx != -1:
        json_str = content[start_idx:end_idx+1]
        try:
            schedule = json.loads(json_str)
            print(f"Found schedule with {len(schedule)} entries.")
            
            # Load data.json
            with open('data.json', 'r') as f:
                data = json.load(f)
            
            data['schedule'] = schedule
            
            with open('data.json', 'w') as f:
                json.dump(data, f, indent=2)
                
            print("Successfully saved schedule to data.json")
        except json.JSONDecodeError:
            print("Failed to parse JSON from output.")
    else:
        print("No JSON array found in output.")

except Exception as e:
    print(f"Error: {e}")
