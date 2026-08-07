import math
x=int(input("Enter the angle in degrees: "))
y=int(input("Enter the number of terms for series: "))
z=math.radians(x)
l=[]
sum=0
for i in range(1,2*y,2):
    p:int
    if i==1:
        l.append(z)
    else:
        #l.append((-1**(i))*(z**(i)/math.factorial(i)))
        l.append(p*(z**(i)/math.factorial(i)))
for i in range(y):
    sum=sum+l[i]
print(sum)
print(l)