<style scoped lang="less">
body{
  background-color: darkgrey;
}
.session {
  width: 400px;
  text-align: center;
  background-color:cadetblue;
  margin:0 auto;
}
</style>
<template>
    <div style="max-width:400px;margin:0 auto; text-align:center;">
        <Row type="flex" justify="center" >
            <Col span="24">
                <div>Session: {{$route.params.id}}</div>
                <div>Player: {{player}}</div>                
                <RadioGroup v-model="point" type="button" size="large" @on-change='pointChanged'>
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
    </div>
    
</template>
<script>
export default {
  data() {
    return {
      sessionId: "",
      player: "",
      point: ""
    };
  },
  methods: {
    pointChanged() {
      console.log(this.point);
    }
  },
  created() {
    if (this.$route.params.id == "0") {
      this.$router.push("/");
      return;
    }
    if (this.player == "") {
      this.$Modal.confirm({
        render: h => {
          return h("Input", {
            props: {
              value: this.player,
              autofocus: true,
              placeholder: "Please enter your name..."
            },
            on: {
              input: val => {
                this.player = val;
              }
            }
          });
        }
      });
    }
  }
};
</script>


