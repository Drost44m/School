==**A**==
1. done
2.  "Ubuntu 26.04.1 LTS" instead of 'LinuxOnTab' 
		kernal is newer 7.0 vs 6.something
		open stack has swap mem ontab does not 
			`cat /proc/cpuinfo` has a ton of info ontab does not 
3. 
		`which` provides location of executable if exists
		`pwd` current working directory
		`who` prints info on whos logged in 
		`whoami` which user are you logged in as
		`env`   shows all environment variables allows to modify current wokring environment settings
		`whereis` `Locate the binary, source, and manual-page files for a command.` ex. `whereis grep`

		
4. Im assuming yes , when using commands like `which` the same directory paths are shown. 
5. `man bash`,  `export PATH="$PATH:."` . being the current directory , making it permanent echoing it to ./.bashrc and sourcing ~/.bashrc
6.  csimpleshell.c
		1. uses new child on every input to run command fork()
		2. does not save what was previously done 
		3. cannot run built in commands like `cd ..`
		4. searches PATH