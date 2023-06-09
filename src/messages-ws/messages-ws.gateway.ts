import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

//Es un controlador, con la unica diferencia que es un controlador gateway
@WebSocketGateway({cors:true, namespace:'/'})        //Activando los cors
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect{     //Estas interfaces nos permiten saber cuando un clinte se conecta y desconecta
  
  //Esta propiedad tiene la informacion de todos los clientes conectados
  //Este puede ser usado para hacer emisiones a todos los usuarios
  @WebSocketServer() wss:Server;
  
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) {}
  
  async handleConnection(client: Socket) {
    // resiviendo el token de los headers
    const token = client.handshake.headers.authentication as string;
    let payload:JwtPayload;

    try {

      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id);
      
    } catch (error) {
      client.disconnect();
      return;
    }

    // console.log({payload});
    // console.log('Cliente conectado', client.id)

    // Con el join unimos al cliente a una sala en especifica
    // client.join('sala')

    //! Emitir mensaje a todos los clientes sin exepcion
    //Devemos de poner un nombre a la emesion
    //Las emisiones mandan un payload
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }

  handleDisconnect(client: Socket) {
    // console.log('Cliente desconectado', client.id)
    this.messagesWsService.removeClient(client.id);
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }

  //Escuchar eventos con nest
  //Indicamos el nombre del evento
  @SubscribeMessage('message-from-client')
  onMessageFromClient(client:Socket, payload:NewMessageDto){

    // console.log(client.id, payload);
    //! Asi solo lo resive el cliente que emitio el mensaje
    // client.emit('message-from-server', {
    //   fullName: 'Soy yo',
    //   message: payload.message || 'no-message'
    // })

    // ! Emitir a todos menos al cliente que emite el mensaje
    // Con el broadcast le emitimos a todos menos al emisor
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'Soy yo',
    //   message: payload.message || 'no-message'
    // })

    // ! Asi se lo mandomos a alguien en especifico o sala especifico
    // this.wss.to('clienteID').emit('','');

    // ! Emitir a todos los cliente, hasta al emisor
    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || 'no-message'
    })
  }

}
