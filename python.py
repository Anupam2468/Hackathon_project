x=4
for i in range(7):
    if i==0:
        print("*"," "*9,"*   *   *   *")
    elif i>0 and i<3:
        
        print("*"," "*9,"*")
    elif i==3:
        for i in range(7):
            print("*", end="   ")
    elif i>3 and i<6:
        if i==4:
            print("\n"," "*9," *"," "*9,"*")
        else:
            print(" "*9,"  *"," "*9,"*")
    else:
        print("*   *   *   *"," "*9,"*")


