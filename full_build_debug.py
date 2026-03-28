import subprocess
import os

def run_build():
    try:
        # Run npm run build and redirect all output to a file
        with open('build_full.log', 'w', encoding='utf-8') as f:
            process = subprocess.Popen(
                ['npm', 'run', 'build'],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                shell=True,
                cwd=os.getcwd()
            )
            
            for line in process.stdout:
                f.write(line)
                f.flush()
                print(line, end='') # Also print to console
                
            process.wait()
            print(f"\nProcess exited with code: {process.returncode}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run_build()
