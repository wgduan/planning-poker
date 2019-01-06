<style scoped lang="less">
.index {
  max-width: 400px;
}
.layout {
  width: 100%;
  text-align: center;
  display: inline-block;
}
.ivu-row {
  padding: 5px;
}
</style>
<template>
    <div style="max-width:400px;margin:0 auto; text-align:center;" >
      <Affix>
        <Row type="flex" style="background-color:#eee;padding:10px;" align="middle">
          <Col span="12" align="left"><h2>Planning Poker</h2> </Col>
          <Col span="12" align="right">
            <div v-if="sessionJoined">
              <!-- <a href="Javascript:void(0);" @click="refreshSession" title="Refresh"><Icon type="person" size="24"></Icon></a>&nbsp;&nbsp;&nbsp; -->
              <Dropdown trigger="click" @on-click="changeRole">
                  <a href="javascript:void(0)">
                      <Icon type="md-person" size="24"></Icon>
                  </a>
                  <DropdownMenu slot="list" style="text-align:center;">
                      <DropdownItem name="player" :selected="role=='player'">Player</DropdownItem>
                      <DropdownItem name="observer" :selected="role=='observer'">Observer</DropdownItem>
                  </DropdownMenu>&nbsp;&nbsp;&nbsp;
              </Dropdown>            
              <Dropdown trigger="click" @on-click="menuClicked">
                  <a href="javascript:void(0)">
                      <Icon type="md-menu" size="24"></Icon>
                  </a>
                  <DropdownMenu slot="list" style="text-align:center;">
                      <DropdownItem name="host" :selected="this.isHost">Host</DropdownItem>
                      <DropdownItem name="refresh" >Refresh</DropdownItem>
                      <DropdownItem v-if="this.isHost"  name="reset" >Reset</DropdownItem>
                      <DropdownItem name="exit" >Exit</DropdownItem>
                  </DropdownMenu>&nbsp;&nbsp;&nbsp;
              </Dropdown>  
              <Modal v-model="showResetModal" @on-ok="resetSession" title="Warning">
                  <p><h3>Reset session will drop everyone in this session, continue to reset session?</h3></p>
              </Modal>              
            </div>
          </Col>
        </Row>
      </Affix>
      <Row v-if="!sessionJoined">
          <Col span="24">
              <Input v-model="playerName" placeholder="Enter your name..." size="large"  />
          </Col>
      </Row>
      <Row v-if="!sessionJoined">
          <Col span="24">
              <Input v-model="sessionId" placeholder="Enter Session ID..." size="large" />
          </Col>
      </Row>
      <Row v-if="!sessionJoined">
          <Col span="24">
          <RadioGroup v-model="role">
            <Radio label="player"><span>Player</span></Radio>
            <Radio label="observer"><span>Observer</span></Radio>
          </RadioGroup>
          </Col>
      </Row>
      <Row :gutter="5" v-if="!sessionJoined">
          <Col span="12" align="left">
                  <i-button type="primary" size="large" style="width:95%"  @click="joinSession">Join</i-button>
          </Col>
          <Col span="12"  align="right">
                  <i-button type="primary" size="large" style="width:95%"  @click="createSession">Create new session</i-button>
          </Col>
      </Row>
      <Row v-if="sessionJoined && role !='observer'">
          <Col span="24"><h3>Please vote your point.</h3></Col>
      </Row>
      <Row v-if="sessionJoined && role !='observer'">
          <Col span="24">                               

                  <RadioGroup v-model="point" type="button" @on-change="vote" size="large">
                      <Radio label="0.5"></Radio>
                      <Radio label="1"></Radio>
                      <Radio label="2"></Radio>
                      <Radio label="3"></Radio>
                      <Radio label="5"></Radio>
                      <Radio label="8"></Radio>
                      <Radio label="13"></Radio>
                      <Radio label="20"></Radio>
                      <Radio label="40"></Radio>
                      <Radio label="100"></Radio>
                  </RadioGroup>                                          

          </Col>
      </Row>
      <Row :gutter="5"  v-if="sessionJoined && this.isHost">
          <Col span="12" align="left">
                  <i-button type="primary" size="large" style="width:95%"  @click="toggleVotes">{{(this.session.showVotes)?'Hide':'Show'}} Votes</i-button>
          </Col>
          <Col span="12" align="right">
                  <i-button type="primary" size="large" style="width:95%"  @click="cleanVotes">Clean Votes</i-button>

          </Col>
      </Row>                
      <Row  v-if="sessionJoined&&showVotes">
          <Col span="24" align="center">
                  <Table :columns="summaryColumns" :data="summary" size="large" no-data-text="No result">
                    <b slot="header">Summary</b>
                  </Table>
          </Col>
      </Row>
      <Row  v-if="sessionJoined">
          <Col span="24" align="center">
                  <Table :columns="columns" :data="players" size="large" no-data-text="No player">
                    <b slot="header">Votes</b>
                  </Table>
          </Col>
      </Row>
      <Row  v-if="sessionJoined">
          <Col span="24" align="center">
                  <Table :columns="observerColumns" :data="observers" size="large" no-data-text="No observer">
                  </Table>
          </Col>
      </Row>

      <br/>
      <hr/>
      <br/>
      <Row type="flex" align="middle">
        <Col span="24" align="center">
          @ 2018 David Duan &nbsp;&nbsp;<a href="https://github.com/wgduan/planning-poker" ><Icon type="logo-github" size="24" color="gray"></Icon></a>
        </Col>
      </Row>
    </div>
</template>
<script>
import io from "socket.io-client";
import AppConfig from '../config/config.js'
var uuidv1 = require("uuid/v1");

export default {
  data() {
    return {
      socket: null,
      playerName: "",
      playerId: "",
      role:"player",
      point: "",
      sessionJoined: false,
      sessionId: "",
      showVotes: false,
      session: { id: "", showVotes: false },
      summary: [],
      showResetModal:false,
      isHost:false,
      //players:[],
      columns: [
        {
          title: "Name",
          key: "name",
          align: "center",
          render: (h, params) => {
            return h(
              params.row.name == this.playerName ? "strong" : "span",
              {
                style: params.row.status == "disconnected" ? "color:silver" : ""
              },
              params.row.name
            );
          }
        },
        {
          title: "Point",
          key: "point",
          align: "center",
          render: (h, params) => {
            if (this.session.showVotes || params.row.name == this.playerName) {
              return params.row.point > 0
                ? h("span", params.row.point)
                : h("Icon", { props: { type: "md-help" } });
            } else {
              return h("Icon", {
                props: {
                  type: params.row.point > 0 ? "md-checkmark-circle" : "md-help",
                  color: params.row.point > 0 ? "lightgreen" : ""
                }
              });
            }
          }
        }
      ],
      summaryColumns: [
        {
          title: "Point",
          key: "point",
          align: "center"
        },
        {
          title: "Count",
          key: "count",
          align: "center"
        }
      ],
      observerColumns: [
        {
          title:"Observers",
          key: "name",
          align: "center"
        },
      ],
    };
  },
  computed:{
    players(){
      return this.session.players.filter(player=>player.role!='observer')
    },
    observers(){
      return this.session.players.filter(player=>player.role=='observer')
    },
  },
  methods: {
    createSession() {
      if(!this.socket)
      {
        this.initSocket();
      }
      //Validation
      if (this.playerName == "") {
        this.$Message.error({
          content: "Please enter your name.",
          closable: true
        });
        return;
      }

      this.isHost=true
      //Emit event
      this.socket.emit("create session", {
        name: this.playerName,
        playerId: this.playerId,
        role:this.role,
        sessionId: this.sessionId
      });
    },
    joinSession() {
      if(!this.socket)
      {
        this.initSocket();
      }      //Validation
      if (this.playerName == "") {
        this.$Message.error({
          content: "Please enter your name.",
          closable: true
        });
        return;
      }
      if (this.sessionId == "") {
        this.$Message.error({
          content: "Please enter session ID.",
          closable: true
        });
        return;
      }
      //this.role='player'
      //Emit event
      this.socket.emit("join session", {
        isHost:false,
        name: this.playerName,
        playerId: this.playerId,
        role:this.role,
        sessionId: this.sessionId
      });
    },
    changeRole(role){
      this.role=role;
      this.socket.emit('change role',{
        name:this.playerName,
        playerId:this.playerId,
        role:this.role,
        sessionId:this.sessionId
      })
    },
    menuClicked(menu){
      switch (menu) {
        case 'host':
          this.isHost=!this.isHost;
          break;
        case 'refresh':
            this.refreshSession();
          break;
        case 'reset':

            this.showResetModal=true;
          break;
        case 'exit':
            this.quitSession();
          break;
      
        default:
          break;
      }
    },
    vote() {
      //Validation
      if (!this.session.players) {
        this.$Message.error({
          content: "Please join or create a session.",
          closable: true
        });
        return;
      }

      //Update point for current player
      let player = this.session.players.find(player => {
        return player.name == this.playerName;
      });
      player.point = this.point;

      //Emit event
      this.socket.emit("vote", {
        name: this.playerName,
        playerId: this.playerId,
        sessionId: this.session.id,
        point: this.point
      });
    },
    toggleVotes() {
      this.socket.emit("toggle votes", {
        playerId: this.playerId,
        sessionId: this.sessionId
      });
    },
    cleanVotes() {
      this.socket.emit("clean votes", {
        playerId: this.playerId,
        sessionId: this.sessionId
      });
    },
    quitSession() {
      this.sessionJoined = false;
      this.socket.emit("quit session", {
        name: this.playerName,
        playerId: this.playerId,
        sessionId: this.session.id
      });
    },
    refreshSession() {
      this.socket.emit("refresh session", {
        playerId: this.playerId,
        sessionId: this.sessionId
      });
    },
    resetSession() {
      this.socket.emit("reset session", {
        playerId: this.playerId,
        sessionId: this.sessionId
      });
    },    
    initSocket(){
      this.socket = io(AppConfig.socketIOUrl);

      this.socket.on("session created", session => {
        console.log("session created: " + JSON.stringify(session));
        this.session = session;
        this.sessionId = session.id;
        this.point = "";
        this.showVotes = session.showVotes;
        this.sessionJoined = true;

        window.history.pushState(null, "", "/" + this.session.id);
      });

      this.socket.on("session joined", session => {
        console.log("session joined: " + session);
        this.session = session;
        this.sessionId = session.id;
        this.point = "";
        this.showVotes = session.showVotes;
        this.sessionJoined = true;
        window.history.pushState(null, "", "/" + this.session.id);
      });

      this.socket.on("player joined", data => {
        console.log("player joined " + data);
        //this.session.players.push(data);
        this.$Notice.open({
          title: data.name + " joined."
        });
      });

      this.socket.on("player left", data => {
        console.log("player left " + data);
        // this.session.players = this.session.players.filter(
        //   player => player.name != data.name
        // );
        this.$Notice.open({
          title: data.name + " left."
        });
      });

      // this.socket.on("player voted", data => {
      //   console.log("player voted: " + data);
      //   let player = this.session.players.find(player => {
      //     return player.name == data.name;
      //   });

      //   if (player) {
      //     player.point = data.point;
      //   }

      // });

      this.socket.on("server error", data => {
        this.$Message.error({
          content: data,
          closable: true
        });
      });

      this.socket.on("votes cleaned", session => {
        this.point = "";
      });

      this.socket.on("session reseted", session => {
        this.sessionJoined=false;
      });
      // this.socket.on("votes toggled", session => {
      //   this.session = session;
      // });

      // this.socket.on("player disconnected", data => {});

      this.socket.on("connect",()=>{
        this.socket.emit("player connect",{
          name:this.playerName,
          playerId: this.playerId,
          sessionId: this.sessionId
        });
      });

      // this.socket.on('player connected',player=>{
        
      // })
      this.socket.on("session updated", session => {
        this.session = session;
        this.showVotes = session.showVotes;
        if (session.showVotes) {
          this.summary = [];
          this.session.players.forEach(player => {
            if(player.role=='observer'){
              return;
            }
            let result = this.summary.find(result => {
              return result.point == player.point;
            });
            if (result) {
              result.count++;
            } else {
              result = { point: player.point, count: 1 };
              this.summary.push(result);
            }
          });

          this.summary.sort((a, b) => {
            return parseInt(b.count) - parseInt(a.count);
          });
        }
      });    
    }

  },

  created() {
    console.log(this.$route.params.id);
    console.log(this.playerId);

    this.playerId = window.localStorage.getItem("playerId");
    if (this.playerId == null) {
      this.playerId = uuidv1();
      window.localStorage.setItem("playerId", this.playerId);
    }
    console.log(this.playerId);

    if (this.$route.params.id) {
      this.sessionId = this.$route.params.id;
    }


  }
};
</script>
