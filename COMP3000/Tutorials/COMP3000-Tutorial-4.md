1.  check 
2. student @ comp3000-2026f : 13:51:01
	~/Tutorials/T4 $ ./3000userlogin student
	uid=1000, euid=1000, gid=1000, egid=1000
	password: x

3. **uid/gid comparison:**
    - Regular user: uid=1000, euid=1000, gid=1000, egid=1000
		- Failed to change to gid 1004
    - Setuid root: 
	    student @ comp3000-2026f : 13:16:21
		/Tutorials/T4 $ ./3000userlogin alice
		uid=1000, euid=0, gid=1000, egid=1000
		alice@comp3000-2026f:~$ id
			uid=1004(alice) gid=1004(alice) groups=1004(alice),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),101(lxd),1000(student)
		alice@comp3000-2026f:~$ 

    - Root shell: 
	    root @ comp3000-2026f : 13:24:48 ROOT SHELL
		/home/student/Tutorials/T4 # ./3000userlogin alice 
		uid=0, euid=0, gid=0, egid=0
		alice@comp3000-2026f:~$ 
		
    - Setgid bit:
	    - Group Root : 
		    student @ comp3000-2026f : 13:29:49
			~/Tutorials/T4 $ ./3000userlogin alice       
			uid=1000, euid=1000, gid=1000, egid=1000
			Failed to change to gid 1004
			
		- Different Group : 
			student @ comp3000-2026f : 13:31:34
			~/Tutorials/T4 $ ./3000userlogin alice 
			uid=1000, euid=1000, gid=1000, egid=100
			Failed to change to gid 1004
    
4. gid before uid: 
		Changing groups needs root. After setuid() the program is no longer root, so it has to change the group first while it can


		`setuid()` works, but then `setgid()` fails because root is already gone. The program prints `Failed to change to gid` and exits without starting a shell swapped setuid and setgid blocks in the code to test

5. check term it works

6. **3000shell as login shell:** Copy it to /usr/local/bin and add that path to /etc/shells, then chsh will accept it. It breaks because PATH may be missing or wrong, since 3000shell reads no startup files. Fix it by having 3000userlogin set PATH (and a clean environment) before execve().

7. **Arbitrary program as shell:** Yes. Login just execs whatever program is listed, such as nologin or /bin/false. You can verify by setting the shell to /usr/bin/bc: it runs bc at login and logs out when bc exits.

8. **Environment variables:**
    - HOME is critical (cd, ~, dotfiles).
    - USER/LOGNAME identify the user to programs.
    - SHELL is used by programs that launch shells.
    - These aren’t the only ones: inherited variables (TERM, LANG, etc.) and bash’s own (PWD, SHLVL) are also present. Check with `env`.