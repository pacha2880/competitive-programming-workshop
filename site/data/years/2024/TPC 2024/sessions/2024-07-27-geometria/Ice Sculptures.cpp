#include <bits/stdc++.h>
using namespace std;
#define conDec(numero,i) fixed << setprecision(i) << numero
#define pb push_back

const int INF=1e9;
int main() {
    int n,aux2=0;
    cin >> n;
    int v[n];
    for(int i = 0;i<n;i++)cin >> v[i],aux2+=v[i];
    int ans = max(-INF,aux2);
    for(int i = 0;i<n;i++){
        for(int k = i+1;k<n;k++){
            int aux = 0;
            int c = 0;
            bool b = 0;
            for(int j = i;j<n;j+=k){
                aux+=v[j];
                c++;
                if((j+k)%n==i)b=1;
            }
            if(c>=3 and b)ans=max(ans,aux);
        }
    }
    cout << ans << endl;
}