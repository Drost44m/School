1.  `/proc`, `/sys`, and `/dev`. 'ls -al' usually not stored on the actual disk

2. The `PATH` environment variable tells the shell where to find executables

3. The first time `nano` is run, it may need to install nano, this is some sort of preset with the OS, normall ymost programs would return a not found error and would require a `sudo dnf install <program name>` or whatever package manager is being used. 

4. 
    - `cat /etc/os-release` Linux distribution and version
    - `uname -r`  kernel version
    - `free -h`   RAM usage
    - `df -h`   disk space and filesystem usage
    - `cat /proc/cpuinfo`  CPU info, has no info 
    
5. The `type` command shows wether its an external command or a builtin command to the OS
    
    - `type cd` - `cd is a shell builtin`
    - `type ls` - shows `ls` is an external command.
    
    `which` returns where the executable is located, usually `usr/bin`
    
6. `df` does not normally report every mounted filesystem because Linux has many virtual or special filesystems.  Including all of them would make `df` less useful for showing actual disk-space usage.

7. BusyBox is a program that combines many common Unix/Linux utilities into a single executable. It is commonly used in small or embedded Linux environments. It can be located using `which busybox`. You can also run `busybox` to see the commands it provides.

8. print out 1-10 pausing every second inbetween after  `$x` will have the value `10`. If the command is interrupted in the middle, `$x` will contain the last value assigned to it before the interupt. 

9.  `echo $x` produces no output.

10. The parentheses cause the `for` loop to run in a subshell. When the command finishes, the value of `$x` in the original shell is unchanged. 

11. Adding `&` runs the command in the background, so the shell immediately returns the command prompt while the loop continues running. The `$x` in the main shell does not change because the loop is running in a subshell.

12. A shell script can be written as:

```
#!/bin/sh

for x in 1 2 3 4 5 6 7 8 9 10
do
    echo $x
    sleep 1
done
```


Other commands on the system can also be shell scripts. `file` can be used to determine whether a command is a shell script.

13. Adding `sh` as the last line starts a new shell after the loop finishes. The new shell is a child process. Unless `x` has been exported it will be undefined in  new shell.

14. `export x` makes `x` an environment variable so that child processes inherit its value. If `export x` is at the end of the script then `x` will have the value `10`  If  placed at the beginning, changes to `x` during the loop are exported