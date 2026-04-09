while(true)
        {

            queue<int> cola;
            cola.push(inicio);
            memset(visitado,0,sizeof visitado);
            while(!cola.empty())
            {
                nodo=cola.front();
                cola.pop();
                for(int i=1;i<=n;i++)
                {
                    if (flujo[nodo][i]>0&& visitado[i]==false)
                    {
                        visitado[i]=true;
                        padre[i]=nodo;
                        cola.push(i);
                    }
                }
            }
            if (visitado[final]==false)
            {

                break;
            }
            int auxnodo=final;
            int minimoflujo=1000000000;
            while(auxnodo!=inicio)
            {
                minimoflujo=min(minimoflujo,flujo[padre[auxnodo]][auxnodo]);
                auxnodo=padre[auxnodo];
            }
            auxnodo=final;        
            while(auxnodo!=inicio)
            {
                flujo[padre[auxnodo]][auxnodo]-=minimoflujo;
                flujo[auxnodo][padre[auxnodo]]+=minimoflujo;
                auxnodo=padre[auxnodo];
            }
            flujototal+=minimoflujo;        
        }
