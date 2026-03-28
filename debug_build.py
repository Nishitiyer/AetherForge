import subprocess
import os

def run_build():
    process = subprocess.Popen(
        ['npm', 'run', 'build'],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        shell=True,
        cwd=os.getcwd()
    )
    
    stdout, stderr = process.communicate()
    
    print("STDOUT:")
    print(stdout)
    print("\nSTDERR:")
    print(stderr)

if __name__ == "__main__":
    run_build()
