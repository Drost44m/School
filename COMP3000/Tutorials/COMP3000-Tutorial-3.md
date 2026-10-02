 1. It is running 
 2. It does **not** create separate terminal sessions/process groups for background jobs. - `ls` still has the same standard input and standard output as the shell. running more complicated programs in the background can cause input to freeze.
 3.  ctrl-c
 4. idk
 5. ls >output.txt
 6. `wait()` returns `-1` if there is no child process available to wait for or an error occurs. prevents errors
 7. printf("Trying %s\n", fn); before the stat() call . 
	 - **~/Tutorials/T3** $ ./3000shell 
	 - student $ ls
	 - Trying /usr/local/sbin/ls
	 - Trying /usr/local/bin/ls
	 - Trying /usr/sbin/ls
	 - Trying /usr/bin/ls
	 - 3000shell  3000shell.c ls.log test

8.  Add following code: 
in `main()`: 
		`if (sigaction(SIGUSR1, &signal_handler_struct, NULL)) { fprintf(stderr, "Couldn't register SIGUSR1 handler.\n"); }`
		
in `signal_handler()`: 
	`if (the_signal == SIGUSR1) { 
	`fprintf(stderr, "Ouch!\n"); 
	return; }
	
`student $ kill -USR1 2270
`Trying /usr/local/sbin/kill
`Trying /usr/local/bin/kill
`Trying /usr/sbin/kill
`Trying /usr/bin/kill
==Ouch! ==
`student $ 
`Process 2276 exited with status 0.

9.  before SA_RESTART is removed when the kill command is given from a seperate terminal , 3000shell wont actually close, it will stay open just hit enter, When SA_restart is removed the shell will be killed. 
10. `getenv()` is part of the standard C library, while `find_env()` is a custom function written specifically for this shell.






