print("===Welcome to Python Retail Shop===")
print("\n")
while 1:
    print("---Enter Item Details---")
    x=input("Enter Item Name (or type 'done' to finish): ")
    y=0
    z=0
    if x.lower()=="done":
            print("Output")
            print("Item Name\tPrice\tQty\tAmount")
            # for i in range(len(item)):
            #     print(f"{item[i]}\t\t{price[i]}\t{qty[i]}\t{price[i]*qty[i]}")
            print(len(item))
            break
    else:
        y=int(input(f"Enter Quantity for {x}: "))
        z=int(input(f"Enter Price per unit for {x}: "))
    print("\n")
    item=[]
    price=[]
    qty=[]
    item.append(x)
    price.append(z)
    qty.append(y)



