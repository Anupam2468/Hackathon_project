# #l=[12,34,56,67]
# l=[]
# n=int(input("Enter the N value: "))
# print("Enter digits one by one:")
# for i in range(n):
#     x=int(input())
#     l.append(x)
# if n%2==0:
#     for i in range(n):
#         a=l[i]
#         l[i]=l[n-i-1]
#         l[n-i-1]=a
# else:
#     for i in range(n):
#         if i==n-i-1:
#             continue
#         else:
#             a=l[i]
#             l[i]=l[n-i-1]
#             l[n-i-1]=a
# print("Circulated List: ",end="")
# for i in range(n):
#     print(l[i],end=" ")

'''
def Arithmetic_Operations(n1,n2):
    r1=n1+n2
    r2=n1-n2
    r3=n1*n2
    r4=n1/n2
    r5=n1%n2
    return r1,r2,r3,r4,r5

num1=int(input("Enter the first Number: "))
num2=int(input("Enter the second Number: "))

result=Arithmetic_Operations(num1,num2)
print(result)
print()
add,sub,mul,div,mod=Arithmetic_Operations(num1,num2)
print(f"{num1}+{num2}={add}")
print(f"{num1}-{num2}={sub}")
print(f"{num1}*{num2}={mul}")
print(f"{num1}%{num2}={mod}")
print(f"{num1}/{num2}={div}")
'''