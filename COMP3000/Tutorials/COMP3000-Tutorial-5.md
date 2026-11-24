**Part A
1. - Regular text file: shows the inode, the length in bytes, and the number of `a` characters.
	- Directory: shows the inode and a length, usually 4096 (the size of the directory’s own data block). There’s no `a` count because `S_ISREG` is false.
	- Symbolic link: `stat` follows the link. You get the target’s inode and length, also the a count if its a reg file
	- Device file (`/dev/null`, `/dev/sda`): length 0, because device files have no stored contents. No `a` count, since it’s not a regular file.

2. Only symlinks behave differently. `lstat` doesn’t follow the link, so you get the link’s own inode, and the length is the number of characters in the target path  You also get no `a` count, since a link isn’t a reg file
3. changes
4. chmod -x hidden or 000 remove permissions for the file to be accessed

**Part B
1. The inode. values are shown
2. `ls -lai` = 268 MB   `du -h foo` = 256M
3. no additional space is used. overwrote it
4. 

**Part C
1.  everything is  listed as 1 when mounted
2. without sudo, `mount foo /mnt` fails because mounting a file requires setting up a loop device, and the loop device files gets EPERM errors
