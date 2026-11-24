A:
4. fifo and fifo-random behave the same.  They print words numbered from Word 0, finish cleanly every time, and “Producer finished.” usually shows up well before the consumer is done.
	- for rendevouz word 0 is always skipped and the cosnumer ends after the producer and after all the words have been printed. 
	- with the timeout the final word is printed in between the producer finishing and the consumer finishing. 

5. fifo: pipe2, clone (the fork), the child doing `write(fd, ..., 16)`, the parent doing `read(fd, ..., 16)`, `clock_nanosleep` for `sleep(1)`, and `write(1, ...)` for each printed line
	fifo-random: adds extra syscalls for calling openat(AT_FDCWD, "/dev/urandom", O_RDONLY <unfinished ...>

	rendevouz: No pipe. There’s one `mmap(... MAP_SHARED|MAP_ANONYMOUS ...)` and a clone, and after that it’s surprisingly quiet. The queue is ordinary memory, so passing a word needs no syscall.

	rendevouz-random: Lots of `futex` waits with timeouts, many returning `ETIMEDOUT`, plus a flood of `clock_nanosleep` calls from `usleep(1)`.

6. 
- Each line shows a PID,   “Queueing”  from the producer  “Outputting” from the consumer

-  The producer races ahead and queues many words before the consumer outputs them. This is clearest in the fifo versions with a slow consumer.
- It doesn’t print the same things for every program. The fifo versions only have the `queue_word` and `output_word` probes. Both rendezvous versions also show the “Waiting for consumer” and “Waiting for producer” lines, so you can see when and how often each side blocks. The timeout version prints these much more often because of its retry loop. With plain rendezvous, if it hangs, the last line is typically a lone “Waiting for producer” with nothing after it.


fifo: kernal does the work 
- If the pipe is empty, read() puts the consumer to sleep until data arrives.
- If the pipe is full (about 64 KB), write() puts the producer to sleep until there’s room.
- Writes of 4096 bytes or less are atomic, so you never get half a word.

fifo random: uses /dev/urandom instead of random() . "really random"

 rendezvous: uses shared mem instead
- A semaphore per slot (sem_t lock), used as a lock so that the producer and consumer don’t touch the same slot same time.
- Two condition variables (queue_nonempty, queue_nonfull), used to sleep until the other side does something, rather than spinning.
- A mutex (cond_mutex), which condition variables require.

rendezvous timeout: 
1. pthread_cond_timedwait with a 10 ms timeout. A lost signal no longer means sleeping forever. You wake up anyway and recheck.
2. A while loop with a retry cap (2000 tries). It keeps rechecking the slot, and it gives up with an error instead of hanging if the other side is truly gone.


Pipes are simple and safe but go through the kernel every time. Shared memory is fast but makes concurrency your problem
==============================================
B:

1. 
	