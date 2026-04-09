#include <bits/stdc++.h>
#define PI 			acos(-1)
#define mp			make_pair
#define pb			push_back
#define all(a)		(a).begin(), (a).end()
#define srt(a)			sort(all(a))
#define mem(a, h)	memset(a, (h), sizeof(a))
#define f 			first
#define s 			second
#define MOD			1000000007
#define EPS			1e-9
int in(){int r=0,c;for(c=getchar();c<=32;c=getchar());if(c=='-') return -in();for(;c>32;r=(r<<1)+(r<<3)+c-'0',c=getchar());return r;}

using namespace std;

typedef long long 		ll;
typedef unsigned long long 		ull;
typedef pair<int, int>  ii;
typedef vector<int>     vi;
typedef vector<ii>      vii;
typedef vector<ll>      vll;
typedef vector<ll>      vll;
vector<int> alz(string a)
{
	int n = a.size();
	vi res(n);
	int left=0,right=0;
	for(int k=1;k<n;k++)
	{
		if(right<k)
		{
			right=left=k;
			while(right<n&&a[right]==a[right-left])
				right++;
			res[k] = right - left;
			right--;
		}
		else
		{
			int k1 = k - left;
			if(res[k1]< right - k + 1)
				res[k] = res[k1];
			else
			{
				left=k;
				while(right<n&&a[right] == a[right-left])
					right++;
				res[k] = right - left;
				right--;
			}
		}
	}
	return res;
}
int main()
{
	string a,b;
	cin>>a>>b;
	vector<int> v = alz(b+'$'+a);
	int ta = a.size();
	int tb = b.size();
	ta = ta + tb + 1;
	for(int i=tb+1;i<ta;i++)
	{
		if(v[i]==tb)
			cout<<i-tb-1<<endl;
	}
	return 0;
}