1. `cp /dev/urandom f1`

- Creates a regular file that grows without limit. `cp` reads until EOF, and `/dev/urandom` never reaches EOF.
- cp: error writing 'f1': No space left on device

 `cp -a /dev/urandom f2`

- Fails as a normal user with `Operation not permitted`, and no f2 is created.

`sudo cp -a /dev/urandom f3`

- Creates a character device node  and returns instantly with no disk use.
- It copies the original’s mode (`crw-rw-rw-`) and timestamps, and is owned by root.

`mknod f4 c 1 9`
- mknod: Operation not permitted (os error 1)
- 

 `sudo mknod f5 c 1 9`

- Creates the same kind of node as f3, but the mode is  crw-r--r-- and the timestamp is new.


- f1 is a regular file with a real size 
- f3 and f5 are device nodes. `ls -l` shows `1, 9` instead of a size, and `stat` says “character special file”.

2. Pipe
- mkfifo p1 
- ls > p1
- second terminal -> wc < p1

3. 
- df / 
- readlink -f /dev/vda2
- ls -l /dev/vda2
- sudo mknod (new name for same pair) -m 600 myroot b 253 2
- sudo dumpe2fs -h myroot
major and minor 252, 1 is what connects myroot to the root directory 
root is required , vda means vm ??

4. q
- tty
- ls -l $(tty) -> crw--w---- 1 student tty ==136, 1== Nov 18 13:30 /dev/pts/1
- sudo mknod mytty c 136 1
- stty -a --file=mytty (gives and error)
- stty --file=$(tty)

- `tty` prints it directly.
- `ls -l /proc/self/fd/0` shows where std input points.
- `ps` lists a TTY column for your shell.

4. stty -echo
- No longer can see myself type however commands still work like `ls`
- `cat` still shows whats contained in file. 
- stty echo restores the ability for me to see what i type